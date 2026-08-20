import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroicons/react", "@tabler/icons-react"],
  },
};

export default nextConfig;
