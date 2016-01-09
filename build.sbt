lazy val commonSettings = Seq(
  organization := "us.cernu",
  version := "0.1.0",
  scalaVersion := "2.11.7"
)

lazy val backend = project
  .settings(commonSettings: _*)
  .settings(
    resolvers += "Twitter" at "http://maven.twttr.com",
    libraryDependencies += "com.twitter.finatra" %% "finatra-http" % "2.1.2",
    libraryDependencies += "com.twitter" %% "finagle-mysql" % "6.31.0",
    libraryDependencies += "com.google.inject" % "guice" % "3.0"
  )