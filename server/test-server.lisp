#!/usr/bin/sbcl --script

(require :uiop)

(defparameter *concurrency-levels* '(100 500 1000 5000))

(defun run-wrk-level (url concurrency &key (threads 12) (duration 20))
  (let* ((cmd (list "wrk"
                    "-t" (format nil "~d" threads)
                    "-c" (format nil "~d" concurrency)
                    "-d" (format nil "~ds" duration)
                    "--latency"
                    "--script=post.lua"
                    url))
         (output (uiop:run-program cmd :output :string :error-output :output)))
    (dolist (line (uiop:split-string output :separator '(#\Newline)))
      (when (or (search "Latency" line)
                (search "Req/Sec" line)
                (search "requests in" line)
                (search "Non-2xx" line)
                (search "Socket errors" line))
        (format t "~a~%" line)))
    (format t "~%~%")))

(defun main (&optional (url "http://localhost:8080"))
  (dolist (c *concurrency-levels*)
    (run-wrk-level url c)
    (sleep 5)))

(main "https://oxcaml-tutorial.gavinleroy.com")
