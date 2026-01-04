#!/usr/bin/env sh
exec guile -l oxserver.scm -e '(oxserver)'
!#

(define-module (oxserver)
  #:use-module (ice-9 threads)
  #:use-module (ice-9 match)
  #:use-module (ice-9 binary-ports)
  #:use-module (ice-9 textual-ports)
  #:use-module (fibers)
  #:use-module (fibers channels)
  #:use-module (fibers web server)
  #:use-module (web request)
  #:use-module (web response)
  #:use-module (web uri)
  #:export (main))

(define filename 
  (or (getenv "OXSERVER_LOG_FILE") 
      "responses.txt"))

(define (respond-with code) 
  (build-response 
    #:code code
    #:headers '((Access-Control-Allow-Origin . "*")
                (Access-Control-Allow-Methods . "POST, GET, OPTIONS")
                (Access-Control-Allow-Headers . "*")
                (Access-Control-Allow-Credentials . "true"))))

(define* (ok #:key (status 204) (value "")) 
  (values (respond-with status) value))

(define (not-found) 
  (values (respond-with 404) "whoops, not found"))

(define-syntax with-file-port
  (lambda (stx)
    (syntax-case stx ()
      ((_ filename #:mode m (p) e ...)
       #'(let ((p #nil))
           (dynamic-wind
             (lambda () (set! p (open-file filename m)))
             (lambda () e ...)
             (lambda () (close-port p)))))
      ((_ filename (p) e ...)
       #'(with-file-port filename #:mode "r" (p) 
          e ...)))))

(define (logger in)
  (with-file-port filename #:mode "ab" (port)
    (let loop ()
     (match (get-message in)
       (('log message) 
        (put-bytevector port message) 
        (put-u8 port #x0a) ; add newline
        (force-output port))
       (msg (format #t "Unknown message~a~%" msg)))
     (loop))))

(define (handler out)
  (lambda (rqst body)
    (match (cons (request-method rqst) (uri-path (request-uri rqst)))
      ((_ . "/") (ok #:status 200 #:value "meow"))
      (('OPTIONS . _) (ok #:status 204)) 
      (('POST . "/answers") 
       (put-message out (list 'log body))
       (ok))
      (_ (not-found)))))

(define* (main #:key (port 8080) . _)
  (run-fibers
   (lambda ()
      (let ((c (make-channel)))
       (spawn-fiber (lambda () (logger c)))
       (run-server (handler c) 
                   #:host "0.0.0.0" 
                   #:port port)))
   #:parallelism (current-processor-count))) 
