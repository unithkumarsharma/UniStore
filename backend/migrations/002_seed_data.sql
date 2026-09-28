-- ====================================================================
-- UNISTORE SEED DATA SCRIPT
-- ====================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Tech & Audio', 'tech-audio', 'High-fidelity audio, wireless accessories, and tactile personal technology.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', 1, TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Home & Living', 'home-living', 'Artisanal ceramics, warm ambient lighting, and Scandinavian home accents.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80', 2, TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Coffee & Kitchen', 'coffee-kitchen', 'Precision pour-over drippers, carafes, and curated morning rituals.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80', 3, TRUE),
    ('44444444-4444-4444-4444-444444444444', 'Self Care', 'self-care', 'Organic wellness, ultrasonic diffusers, and botanical grooming essentials.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', 4, TRUE),
    ('55555555-5555-5555-5555-555555555555', 'Desk Setup', 'desk-setup', 'Ergonomic seating, precision aluminum risers, and tactile desk pads.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80', 5, TRUE),
    ('66666666-6666-6666-6666-666666666666', 'Travel Gear', 'travel-gear', 'Weatherproof sling packs, organizers, and durable everyday carry.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Products
INSERT INTO products (id, name, slug, description, category_id, base_price, compare_at_price, sku, stock, is_active, is_featured, is_bestseller, rating, review_count, badge)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Aura Sound Pro Wireless Noise-Cancelling Headphones', 'aura-sound-pro-headphones', 'Studio-grade acoustic immersion engineered with 40mm custom planar drivers, active noise cancellation up to 42dB, and 38-hour battery longevity.', '11111111-1111-1111-1111-111111111111', 8499.00, 11999.00, 'UNI-AUD-001', 45, TRUE, TRUE, TRUE, 4.90, 1240, '29% OFF'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nordic Minimalist Ceramic Pour-Over Dripper', 'nordic-ceramic-pour-over-dripper', 'Handcrafted stoneware dripper with conical internal spiral ribs calibrated for optimal water drawdown.', '33333333-3333-3333-3333-333333333333', 1899.00, 2499.00, 'UNI-COF-002', 62, TRUE, TRUE, FALSE, 4.80, 420, 'HOT'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Lumbar Ergonomic Sculpt Desk Chair', 'lumbar-ergonomic-sculpt-chair', 'Engineered for sustained 12-hour postural alignment with breathable 3D woven tensile mesh and 4D armrests.', '55555555-5555-5555-5555-555555555555', 14299.00, 18999.00, 'UNI-DSK-003', 14, TRUE, TRUE, FALSE, 4.90, 880, 'POPULAR'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Orbit MagSafe 3-in-1 Wireless Charging Dock', 'orbit-magsafe-wireless-charging-dock', 'Solid FSC-certified American walnut base with fast 15W MagSafe phone charging and Apple Watch cradle.', '11111111-1111-1111-1111-111111111111', 3299.00, 4199.00, 'UNI-TEC-004', 50, TRUE, TRUE, FALSE, 4.70, 310, '21% OFF'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Kanso Ultrasonic Ceramic Aroma Diffuser', 'kanso-ultrasonic-aroma-diffuser', 'Sculptural matte porcelain shell diffusing 2.4MHz ultrasonic cool mist with warm ambient LED halo ring.', '44444444-4444-4444-4444-444444444444', 2499.00, 2999.00, 'UNI-SLC-005', 38, TRUE, TRUE, TRUE, 4.90, 640, 'Bestseller'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Thermal Vessel Vacuum Insulated Bottle 750ml', 'thermal-vessel-insulated-bottle-750ml', 'Double-walled copper-lined 18/8 stainless steel keeps cold for 24 hours or hot for 12 hours with natural beechwood loop cap.', '66666666-6666-6666-6666-666666666666', 1499.00, 1999.00, 'UNI-TRV-006', 85, TRUE, TRUE, TRUE, 4.80, 912, 'Bestseller')
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Product Images
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Aura Sound Pro Headphones', 1, TRUE),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 'Nordic Dripper', 1, TRUE),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&q=80', 'Ergonomic Chair', 1, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80', 'Orbit MagSafe', 1, TRUE),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', 'Kanso Diffuser', 1, TRUE),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 'Thermal Vessel', 1, TRUE);

-- 4. Insert Product Variants
INSERT INTO product_variants (product_id, title, sku, price, compare_at_price, stock, attributes)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Matte Charcoal', 'UNI-AUD-001-CHR', 8499.00, 11999.00, 25, '{"Color": "Matte Charcoal"}'::jsonb),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Warm Sand', 'UNI-AUD-001-SND', 8499.00, 11999.00, 20, '{"Color": "Warm Sand"}'::jsonb);

-- 5. Insert Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, is_active)
VALUES
    ('WELCOME10', 'PERCENTAGE', 10.00, 0.00, 1000, TRUE),
    ('UNISTORE10', 'PERCENTAGE', 10.00, 0.00, 1000, TRUE),
    ('FESTIVE20', 'PERCENTAGE', 20.00, 1499.00, 500, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 6. Insert Demo Admin and Customer Users
INSERT INTO users (id, email, full_name, phone, role)
VALUES
    ('99999999-9999-9999-9999-999999999999', 'admin@unistore.com', 'UniStore Administrator', '+91 99999 88888', 'ADMIN'),
    ('88888888-8888-8888-8888-888888888888', 'customer@unistore.com', 'Arjun Sharma', '+91 98765 43210', 'CUSTOMER')
ON CONFLICT (email) DO NOTHING;

-- 7. Insert Suppliers
INSERT INTO suppliers (name, code, contact_email, fulfillment_sla_hours)
VALUES
    ('Nordic Lifestyle Suppliers Ltd.', 'SUP-NDIC', 'fulfillment@nordiclifestyle.test', 24),
    ('Acoustic Craft Audio Partners', 'SUP-ACST', 'orders@acousticcraft.test', 12)
ON CONFLICT (code) DO NOTHING;
