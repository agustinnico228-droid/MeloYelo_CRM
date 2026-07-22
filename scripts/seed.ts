/**
 * Seed starter CMS content. Requires DATABASE_URI (and PAYLOAD_SECRET).
 *
 *   SEED_ADMIN_EMAIL=you@meloyelo.nz SEED_ADMIN_PASSWORD=… npm run seed
 *
 * Safe to re-run: everything is skipped if it already exists.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

async function seed() {
  const payload = await getPayload({ config });

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: adminEmail } },
      limit: 1,
    });
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: "users",
        data: { email: adminEmail, password: adminPassword, role: "admin" },
      });
      console.log(`Created admin user ${adminEmail}`);
    }
  } else {
    console.log("SEED_ADMIN_EMAIL/PASSWORD not set — skipping admin user");
  }

  const guides = await payload.count({ collection: "guides" });
  if (guides.totalDocs === 0) {
    await payload.create({
      collection: "guides",
      data: {
        title: "Getting started with the hub",
        slug: "getting-started",
        summary:
          "Sign in, find your leads, make your first call and update a stage.",
        audience: "all",
        _status: "published",
        content: {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: "ltr",
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "ltr",
                children: [
                  {
                    type: "text",
                    version: 1,
                    text: "Open Today to see the leads that need action. Tap Call to ring them, then Update to change the stage and add a note — that's the whole loop.",
                  },
                ],
              },
            ],
          },
        },
      },
    });
    console.log("Created starter guide");
  }

  const announcements = await payload.count({ collection: "announcements" });
  if (announcements.totalDocs === 0) {
    await payload.create({
      collection: "announcements",
      data: {
        title: "Welcome to the new CRM Hub",
        severity: "info",
        published: true,
        audience: "all",
      },
    });
    console.log("Created welcome announcement");
  }

  const links = await payload.count({ collection: "quickLinks" });
  if (links.totalDocs === 0) {
    await payload.create({
      collection: "quickLinks",
      data: {
        label: "MeloYelo website",
        url: "https://www.meloyelo.nz",
        group: "Company",
        audience: "all",
      },
    });
    console.log("Created starter quick link");
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
