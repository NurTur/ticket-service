ALTER TABLE `customers`
    DROP INDEX `name`,
    DROP INDEX `customertypeid`,
    DROP INDEX `name_customertypeid`;

ALTER TABLE `users`
    DROP INDEX `name`,
    DROP INDEX `departmentid`,
    DROP INDEX `name_departmentid`;