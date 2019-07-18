SELECT
    id,
    name
FROM customers
WHERE 
    LOWER(name) LIKE ?
ORDER BY
    customertypeid ASC, name ASC
LIMIT ?
;