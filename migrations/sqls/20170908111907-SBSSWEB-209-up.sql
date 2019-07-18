CREATE DEFINER=`ts`@`%` FUNCTION `GetTopTicketId`(`ticket_id` INT)
    RETURNS int(11)
    LANGUAGE SQL
    NOT DETERMINISTIC
    READS SQL DATA
    SQL SECURITY DEFINER
    COMMENT 'Возвращает идентификатор изначальной родительской заявки по идентификатору любой дочерней'
BEGIN
    DECLARE __id INT;
    DECLARE __pid INT;
    
    SET __pid = ticket_id;
    
    REPEAT
        SELECT 
            o.id,
            o.parentorderid
        INTO __id, __pid
        FROM orders o
        WHERE
            o.id = __pid;

    UNTIL __pid = 0 OR __pid IS NULL OR __id IS NULL
    END REPEAT;
    
    RETURN __id;
END;
