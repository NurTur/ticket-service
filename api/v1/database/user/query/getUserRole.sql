SELECT
    MAX(g.weight) `role`
FROM groups g
INNER JOIN users u ON u.id = :userId
WHERE
    g.weight < 8 
    AND u.blocked = 0
    AND FIND_IN_SET(:userId, g.userslist) > 0
;