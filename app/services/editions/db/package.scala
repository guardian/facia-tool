package services.editions

package object db {
  // see https://www.postgresql.org/docs/current/errcodes-appendix.html
  final val ForeignKeyViolationSQLState = "23503"
}
