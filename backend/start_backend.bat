@echo off
set JAVA_HOME=C:\Users\meash\.jdks\ms-21.0.9
set PATH=%JAVA_HOME%\bin;%PATH%
echo Using Java:
java -version
echo.
echo Starting SRATS Backend (Spring Boot with H2 in-memory database)...
..\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
