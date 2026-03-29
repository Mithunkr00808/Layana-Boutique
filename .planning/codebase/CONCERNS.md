# Tech Debt and Areas of Concern

## Security & Access Control
Currently, the `/admin` route namespace lacks strict session-level authentication (like NextAuth or Firebase tokens mapping to user roles). While this works entirely functionally for local bootstrapping, putting this code into a live production `vercel` deploy means an unauthorized client could edit catalog contents directly through Server Actions if they discover the Next 15 paths.

## Form Integrity
The `ProductForm` leverages some basic HTML5 validations (`required` attribute). A deeper adoption of Zod to intercept all actions asynchronously in `actions.ts` might be necessary as custom product structures get significantly more nuanced (for example mapping nested size availability objects perfectly or throwing formal field errors).

## Cache Synchronization
When creating or editing a document through `src/app/admin/actions.ts`, Next.js aggressively wipes the cache tree paths related to store browsing (`revalidatePath("/")`). As traffic increases, targeting specifics (e.g. `revalidateTag` per single item changed) to avoid blasting all ISR generation nodes will scale more cheaply.
