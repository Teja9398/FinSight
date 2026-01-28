# -------- Stage 1: Build the application --------
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy only pom.xml first (dependency caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build JAR
RUN mvn clean package -DskipTests


# -------- Stage 2: Run the application --------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy jar from builder stage
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 7000

ENTRYPOINT ["java","-jar","app.jar"]
