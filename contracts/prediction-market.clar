;; Prediction Market Contract

(define-data-var market-id-nonce uint u0)

(define-map markets
  { market-id: uint }
  {
    creator: principal,
    description: (string-utf8 256),
    options: (list 10 (string-utf8 64)),
    resolution-time: uint,
    oracle: principal,
    is-resolved: bool,
    winning-option: (optional uint)
  }
)

(define-map market-positions
  { market-id: uint, user: principal }
  { positions: (list 10 uint) }
)

(define-constant ERR-UNAUTHORIZED (err u401))
(define-constant ERR-INVALID-MARKET (err u402))
(define-constant ERR-MARKET-ALREADY-RESOLVED (err u403))
(define-constant ERR-MARKET-NOT-RESOLVED (err u404))

(define-public (create-market (description (string-utf8 256)) (options (list 10 (string-utf8 64))) (resolution-time uint) (oracle principal))
  (let
    (
      (market-id (var-get market-id-nonce))
    )
    (asserts! (> (len options) u0) (err u400))
    (asserts! (< (len options) u11) (err u400))
    (asserts! (> resolution-time block-height) (err u400))
    (map-set markets
      { market-id: market-id }
      {
        creator: tx-sender,
        description: description,
        options: options,
        resolution-time: resolution-time,
        oracle: oracle,
        is-resolved: false,
        winning-option: none
      }
    )
    (var-set market-id-nonce (+ market-id u1))
    (ok market-id)
  )
)

(define-public (place-prediction (market-id uint) (option uint) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-INVALID-MARKET))
      (current-positions (default-to { positions: (list) } (map-get? market-positions { market-id: market-id, user: tx-sender })))
    )
    (asserts! (not (get is-resolved market)) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (< option (len (get options market))) (err u400))
    (ok (map-set market-positions
      { market-id: market-id, user: tx-sender }
      {
        positions: (unwrap! (as-max-len? (append (get positions current-positions) amount) u10) (err u500))
      }
    ))
  )
)

(define-public (resolve-market (market-id uint) (winning-option uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-INVALID-MARKET))
    )
    (asserts! (is-eq tx-sender (get oracle market)) ERR-UNAUTHORIZED)
    (asserts! (not (get is-resolved market)) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (>= block-height (get resolution-time market)) (err u400))
    (asserts! (< winning-option (len (get options market))) (err u400))
    (map-set markets
      { market-id: market-id }
      (merge market { is-resolved: true, winning-option: (some winning-option) })
    )
    (ok true)
  )
)

(define-public (claim-winnings (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-INVALID-MARKET))
      (user-positions (unwrap! (map-get? market-positions { market-id: market-id, user: tx-sender }) (err u400)))
    )
    (asserts! (get is-resolved market) ERR-MARKET-NOT-RESOLVED)
    (let
      (
        (winning-option (unwrap! (get winning-option market) (err u500)))
        (winning-amount (unwrap! (element-at (get positions user-positions) winning-option) (err u500)))
      )
      (try! (as-contract (stx-transfer? winning-amount tx-sender tx-sender)))
      (map-delete market-positions { market-id: market-id, user: tx-sender })
      (ok winning-amount)
    )
  )
)

(define-read-only (get-market (market-id uint))
  (ok (unwrap! (map-get? markets { market-id: market-id }) ERR-INVALID-MARKET))
)

(define-read-only (get-user-positions (market-id uint) (user principal))
  (ok (unwrap! (map-get? market-positions { market-id: market-id, user: user }) (err u400)))
)

