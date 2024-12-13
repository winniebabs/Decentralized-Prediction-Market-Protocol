;; Oracle Contract

(define-map trusted-oracles
  { oracle: principal }
  { is-trusted: bool }
)

(define-map market-results
  { market-id: uint }
  { result: uint }
)

(define-constant contract-owner tx-sender)
(define-constant ERR-UNAUTHORIZED (err u401))
(define-constant ERR-NOT-TRUSTED-ORACLE (err u402))

(define-public (add-trusted-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (ok (map-set trusted-oracles { oracle: oracle } { is-trusted: true }))
  )
)

(define-public (remove-trusted-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (ok (map-delete trusted-oracles { oracle: oracle }))
  )
)

(define-public (submit-result (market-id uint) (result uint))
  (begin
    (asserts! (is-trusted-oracle tx-sender) ERR-NOT-TRUSTED-ORACLE)
    (ok (map-set market-results { market-id: market-id } { result: result }))
  )
)

(define-read-only (is-trusted-oracle (oracle principal))
  (default-to false (get is-trusted (map-get? trusted-oracles { oracle: oracle })))
)

(define-read-only (get-market-result (market-id uint))
  (map-get? market-results { market-id: market-id })
)

