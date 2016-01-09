package us.cernu.pathblock.backend

import java.util.UUID

import com.google.inject.Inject
import com.twitter.finagle.exp.mysql.{Error, OK, StringValue, Client}
import com.twitter.util.Future

class Model @Inject()(mysql: Client) {
  def tokens(): Future[Seq[Token]] = {
    mysql
      .select("SELECT token FROM auth_tokens") { row =>
        row("token") flatMap {
          case StringValue(s) => Some(Token(s))
          case _ => None
        }
      }.map {
      _.flatten
    }
  }

  def datum(token: Token, name: String): Future[Option[Datum]] = {
    mysql
      .prepare("SELECT value FROM data WHERE name=? AND token=?")
      .select(name,token.underlying) { row =>
        row("value") flatMap {
          case StringValue(s) => Some(Datum(name, s))
          case _ => None
        }
      }.map {
      _.headOption.flatten
    }
  }
}

case class Datum(name: String, value: String) {
  def save(token: Token, mysql: Client): Future[Datum] = {
    mysql
      .prepare("REPLACE INTO data (token,name,value) VALUES (?,?,?)")
      .apply(token.underlying, name, value)
      .flatMap({
        case _: OK => Future(this)
        case Error(code, state, message) => Future.exception(new Throwable(message))
        case r => Future.exception(new Throwable(s"unexpected response $r"))
      })
  }
}

case class Token(underlying: String) extends AnyVal

object Token {
  def generate(mysql: Client): Future[Token] = {
    val id = UUID.randomUUID().toString
    mysql
      .prepare("INSERT INTO auth_tokens (token) VALUES (?)")
      .apply(StringValue(id))
      .flatMap({
        case r: OK => Future(Token(id))
        case Error(code, state, message) => Future.exception(new Throwable(message))
        case r => Future.exception(new Throwable(s"unexpected response $r"))
      })
  }
}