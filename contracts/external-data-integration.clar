;; External Data Integration Contract

(define-map data-sources
  { source-id: uint }
  { name: (string-utf8 64), url: (string-utf8 256), api-key: (string-utf8 64) }
)

(define-data-var data-source-nonce uint u0)

(define-constant contract-owner tx-sender)
(define-constant ERR-UNAUTHORIZED (err u401))
(define-constant ERR-INVALID-SOURCE (err u402))

(define-public (add-data-source (name (string-utf8 64)) (url (string-utf8 256)) (api-key (string-utf8 64)))
  (let
    (
      (source-id (var-get data-source-nonce))
    )
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (map-set data-sources
      { source-id: source-id }
      { name: name, url: url, api-key: api-key }
    )
    (var-set data-source-nonce (+ source-id u1))
    (ok source-id)
  )
)

(define-public (update-data-source (source-id uint) (name (string-utf8 64)) (url (string-utf8 256)) (api-key (string-utf8 64)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (asserts! (is-some (map-get? data-sources { source-id: source-id })) ERR-INVALID-SOURCE)
    (ok (map-set data-sources
      { source-id: source-id }
      { name: name, url: url, api-key: api-key }
    ))
  )
)

(define-public (remove-data-source (source-id uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (ok (map-delete data-sources { source-id: source-id }))
  )
)

(define-read-only (get-data-source (source-id uint))
  (ok (unwrap! (map-get? data-sources { source-id: source-id }) ERR-INVALID-SOURCE))
)

