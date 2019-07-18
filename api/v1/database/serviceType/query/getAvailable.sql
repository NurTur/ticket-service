SELECT
    st.*
FROM orders o
INNER JOIN service_type_dependence st_d ON o.ordertypeid = st_d.ticket_type_id
INNER JOIN servicetype st ON st_d.service_type_id = st.id
WHERE
    o.id = ?
    AND st_d.service_type_id != o.servicetypeid
;