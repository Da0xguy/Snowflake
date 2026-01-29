import { z } from "zod";

const serverSchema = z.object({
    SUI_PRIVATE_KEY: z.string().min(1, "SUI_PRIVATE_KEY is missing"),
    ADMIN_CAP_ID: z.string().min(1, "ADMIN_CAP_ID is missing"),
});

const clientSchema = z.object({
    NEXT_PUBLIC_PACKAGE_ID: z.string().min(1, "NEXT_PUBLIC_PACKAGE_ID is missing"),
    NEXT_PUBLIC_REGISTRY_ID: z.string().min(1, "NEXT_PUBLIC_REGISTRY_ID is missing"),
});

const processEnv = {
    SUI_PRIVATE_KEY: process.env.SUI_PRIVATE_KEY,
    ADMIN_CAP_ID: process.env.ADMIN_CAP_ID,
    NEXT_PUBLIC_PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID,
    NEXT_PUBLIC_REGISTRY_ID: process.env.NEXT_PUBLIC_REGISTRY_ID,
};

// Validate
try {
    serverSchema.parse(processEnv);
    clientSchema.parse(processEnv);
    console.log("✅ Environment variables validated!");
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error("❌ Invalid environment variables:");
        // Try .issues, then .errors, then fallback
        const issues = error.issues || error.errors;
        if (Array.isArray(issues)) {
            issues.forEach((err) => {
                console.error(` - ${err.path.join(".")}: ${err.message}`);
            });
        } else {
            console.error(JSON.stringify(error, null, 2));
        }
        process.exit(1);
    } else {
        console.error("Unknown error validating env vars", error);
        process.exit(1);
    }
}
