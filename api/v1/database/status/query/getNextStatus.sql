SELECT 
    o.id as `ticketId`,
    s.id, 
    s.name 
FROM orders o
INNER JOIN ticket_next_status ns ON o.statusid = ns.current_id 
INNER JOIN role_status rs ON rs.status_id = ns.next_id
INNER JOIN `status` s ON ns.next_id = s.id
WHERE
    rs.role_id = ?
    AND ns.ticket_type_id = o.ordertypeid
    AND o.id IN (?)
;