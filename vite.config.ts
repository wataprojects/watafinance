import { defineConfig, type Plugin } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const fixExpensesPageBuildConflict = (): Plugin => ({
  name: "fix-expenses-page-build-conflict",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith("src/pages/dashboard/ExpensesPage.tsx")) {
      return null;
    }

    return {
      code: code.replace(/\n\s*CreditCard,\s*/m, "\n"),
      map: null,
    };
  },
});

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [fixExpensesPageBuildConflict(), dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));