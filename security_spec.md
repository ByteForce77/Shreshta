# Security Specification: POLUMATI'S SHRESHTA™

## 1. Data Invariants
1. Products, Categories, and Banners are readable by any authenticated or guest client, but writeable only by Admin users (`role == 'ADMIN'` or admin email).
2. Users can only read and write their own User document (`users/{userId}` where `request.auth.uid == userId`) and Addresses (`addresses/{addressId}` where `resource.data.user_id == request.auth.uid`).
3. Users cannot elevate their own role to `ADMIN` or spoof their `loyalty_points` arbitrarily.
4. Orders can be created by authenticated users where `request.resource.data.user_id == request.auth.uid`. Users can only read their own orders. Only Admins can update arbitrary order statuses (e.g., PACKED, OUT_FOR_DELIVERY, DELIVERED).
5. Subscriptions can be created and managed by the owner (`user_id == request.auth.uid`) or Admins.
6. Support tickets can be submitted by authenticated users for their own user_id.

## 2. The Dirty Dozen Payloads (Should return PERMISSION_DENIED)
1. **Admin Escalation**: User tries to update `role: 'ADMIN'` on their own profile doc.
2. **Order Forgery**: Attacker sends order creation with another user's `user_id`.
3. **Price Tampering**: Attacker attempts to update product pricing without admin credentials.
4. **Order Status Manipulation**: Non-admin customer tries to set `order_status: 'DELIVERED'` directly.
5. **Address Scraping**: Attacker tries to read another user's private address document.
6. **Ticket Impersonation**: Attacker creates a support ticket under someone else's user ID.
7. **Coupon Injection**: Non-admin attacker tries to create a 100% discount coupon in `coupons`.
8. **Subscription Hijacking**: Non-owner attempts to cancel or modify someone else's subscription.
9. **Banner Defacement**: Unauthenticated or normal user tries to update promo banners.
10. **ID Poisoning Attack**: Attacker injects a 500-character malicious path ID with control characters.
11. **Excessive Field Injection**: Attacker injects shadow fields like `is_vip: true` or `unlimited_balance: 999999`.
12. **Blanket Query Scraping**: Malicious client attempts to list all users' addresses without filtering by their own user ID.
