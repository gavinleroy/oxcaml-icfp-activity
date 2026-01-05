(defpackage :oxserver
  (:use :cl)
  (:export :main))

(in-package :oxserver)

;;; ----------------------------------------------------------------------------
;;; Configuration & Globals
;;; ----------------------------------------------------------------------------

(defvar *log-file* (or (uiop:getenv "OXSERVER_LOG_FILE") "responses.txt"))

(defconstant +buffer-size+ 4096)

(defvar *log-queue* (sb-concurrency:make-mailbox))

(defparameter *cors-headers*
  '(:access-control-allow-origin "*"
    :access-control-allow-methods "POST, GET, OPTIONS"
    :access-control-allow-headers "*"
    :access-control-allow-credentials "true"))

(defvar *buffer-pool* (sb-concurrency:make-queue))
(defconstant +page-size+ 4096)

(defun get-buffer (size)
  (or (sb-concurrency:dequeue *buffer-pool*)
      (make-array (max size +page-size+) :element-type '(unsigned-byte 8))))

(defun release-buffer (buffer)
  (when (= (length buffer) +page-size+)
    (sb-concurrency:enqueue buffer *buffer-pool*)))

(defstruct log-entry
  (data nil :type (simple-array (unsigned-byte 8) (*)))
  (length 0 :type fixnum))

(defun logger ()
  (with-open-file (stream *log-file*
                          :direction :output
                          :if-exists :append
                          :if-does-not-exist :create
                          :element-type '(unsigned-byte 8))
    (loop for msg = (sb-concurrency:receive-message *log-queue*)
          do (typecase msg
               (symbol (when (eq msg :stop) (return)))
               (log-entry 
                 (write-sequence (log-entry-data msg) stream :end (log-entry-length msg))
                 (write-byte #x0A stream)
                 (force-output stream)
                 (release-buffer (log-entry-data msg)))))))

(defun start-logger-thread ()
  (sb-thread:make-thread #'logger :name "logger-thread"))

(defun read-body-to-vector (env)
  (let ((content-len (getf env :content-length))
        (stream (getf env :raw-body)))
    (when (and content-len (0 < content-len))
      (let* ((buffer (get-buffer content-len))
             (bytes-read (read-sequence buffer stream :end content-len)))
        (make-log-entry :data buffer :length bytes-read)))))

(defun handle-request (env)
  (let ((path (getf env :path-info))
        (method (getf env :request-method))) ;; Returns keywords :GET, :POST, etc.
    
    (cond
      ((and (eq method :get) (string= path "/"))
       `(200 ,*cors-headers* ("meow")))
      ((eq method :options)
       `(204 ,*cors-headers* ("")))
      ((and (eq method :post) (string= path "/answers"))
       (let ((body (read-body-to-vector env)))
         (when body
           (sb-concurrency:send-message *log-queue* body)))
       `(204 ,*cors-headers* ("")))
      (t
       `(404 ,*cors-headers* ("whoops, not found"))))))

;;; ----------------------------------------------------------------------------
;;; Main Entry Point
;;; ----------------------------------------------------------------------------

(defun main (&optional (port 8080))
  (format t "Starting Logger Thread...~%")
  (start-logger-thread)
  (format t "Starting Server on 0.0.0.0:~a...~%" port)
  (woo:run #'handle-request 
           :address "0.0.0.0"
           :port port
           ;:debug nil 
           :worker-num 2)) ;; FIXME: dynamically load this?
