-- Update users who don't own any events to be ATTENDEE role
-- First, let's see current user roles
SELECT u.email, u.role, COUNT(e.id) as event_count
FROM "User" u
LEFT JOIN "Event" e ON u.id = e."ownerId"
GROUP BY u.id, u.email, u.role;

-- Update users who have no events to ATTENDEE role (excluding ADMIN and STAFF)
UPDATE "User" 
SET role = 'ATTENDEE' 
WHERE id NOT IN (
    SELECT DISTINCT u.id 
    FROM "User" u 
    INNER JOIN "Event" e ON u.id = e."ownerId"
) 
AND role NOT IN ('ADMIN', 'STAFF');
