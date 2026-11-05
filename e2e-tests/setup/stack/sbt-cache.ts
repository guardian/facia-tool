interface BindMount {
  source: string;
  target: string;
  mode: "rw" | "ro";
}

export function sbtCacheBindMounts(): BindMount[] {
  const mounts: BindMount[] = [];
  const coursier = process.env.DEVENV_COURSIER_CACHE_MOUNT_DIR;
  const ivy = process.env.DEVENV_IVY_CACHE_MOUNT_DIR;

  if (coursier) {
    mounts.push({
      source: coursier,
      target: "/root/.cache/coursier",
      mode: "rw",
    });
  }
  if (ivy) {
    mounts.push({ source: ivy, target: "/root/.ivy2", mode: "rw" });
  }

  return mounts;
}