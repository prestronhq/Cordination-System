import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ["lucide-react", "@heroicons/react", "@tabler/icons-react"],
  },
};

export default nextConfig;
