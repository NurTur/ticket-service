SELECT 
    id
FROM groups 
WHERE 
    weight = :role
LIMIT 1;