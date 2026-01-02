(require :asdf)
(eval-when (:load-toplevel :compile-toplevel :execute)
  (asdf:load-system :drakma)
  (asdf:load-system :lparallel))

(defpackage :test-activity-server
  (:use :cl)
  (:local-nicknames
    (:drak :drakma)
    (:par  :lparallel)))

(in-package :test-activity-server)

(defun make-request (url &optional (body nil))
 (handler-case
     (if (stringp body)
         (drak:http-request url
                            :method :post
                            :content body
                            :content-type "application/octet-stream"  ; default
                            :connection-timeout 10)
         (drak:http-request url :method :get :connection-timeout 10))
   (error (e)
     (format *error-output* "Error on request to ~a: ~a~%" url e)
     (values nil nil))))

(defun request (path &key (body nil))
    (make-request (format nil "https://oxcaml-tutorial.gavinleroy.com/~a" path)
                  body))

(defun submit-answer ()
  (multiple-value-bind (body status)
      (request "answers" :body "=== dummy-line ===")
    (declare (ignore body))
    (case status
      (204 t)
      (otherwise 
        (format *error-output* "Unexpected status: ~a" status)))))

(defun get-count ()
  (multiple-value-bind (body status) 
      (request "count")
    (case status
      (200 (parse-integer body))
      (otherwise 
        (format *error-output* "Unexpected status: ~a" status)))))

(defun main ()
  (let* ((kernel (par:make-kernel 32 :name "request-pool"))
         (times 10000))
    (let ((par:*kernel* kernel)
          (initial-count (get-count)))
      (par:pdotimes (i times)
        (declare (ignore i))
        (assert (submit-answer)))
      (par:end-kernel :wait t)
      (assert (= (+ initial-count times) (get-count))))))

(eval-when (:execute)
  (main))
 
