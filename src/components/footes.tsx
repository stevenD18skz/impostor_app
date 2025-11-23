import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Derechos a mi &copy; {new Date().getFullYear()}
        </p>
        
        <Link
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span>Mi GitHub</span>
        </Link>
      </div>
    </footer>
  );
}
