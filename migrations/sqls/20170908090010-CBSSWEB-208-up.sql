ALTER TABLE `customers`
    ADD INDEX `name` (`name`),
    ADD INDEX `customertypeid` (`customertypeid`),
    ADD INDEX `name_customertypeid` (`name`, `customertypeid`);

ALTER TABLE `users`
    ADD INDEX `name` (`name`),
    ADD INDEX `departmentid` (`departmentid`),
    ADD INDEX `name_departmentid` (`name`, `departmentid`);