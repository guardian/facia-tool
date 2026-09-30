# syntax=docker/dockerfile:1
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    MISE_DATA_DIR=/mise \
    MISE_CONFIG_DIR=/mise \
    MISE_CACHE_DIR=/mise/cache \
    MISE_INSTALL_PATH=/usr/local/bin/mise \
    PATH="/mise/shims:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
      bash ca-certificates curl git openssl && \
    rm -rf /var/lib/apt/lists/*
RUN curl https://mise.run | sh

WORKDIR /toolchain
COPY .tool-versions ./.tool-versions
RUN --mount=type=cache,target=/mise/cache,sharing=locked \
    mise trust -a && mise install && \
    corepack enable && corepack prepare yarn@1.22.22 --activate && \
    printf 'export JAVA_HOME=%s\nexport PATH=%s/bin:%s/bin:%s/bin:$PATH\n' \
      "$(mise where java)" "$(mise where java)" "$(mise where sbt)" "$(mise where node)" \
      > /etc/profile.d/mise-tools.sh

EXPOSE 9000 5173
CMD ["bash", "/app/e2e-tests/images/start-app"]
