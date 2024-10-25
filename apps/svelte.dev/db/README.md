# Database setup

Login to [Supabase](https://supabase.com) and create a database. Once done, you should be on your database's dashboard. Duplicate the `.env.example` file and rename it to `.env.local`, and set these environment variables:

- `SUPABASE_URL`: The config URL
- `SUPABASE_KEY`: The public API key

Then, navigate to your database's "SQL Editor", click on "New query", and paste in [setup.sql](./setup.sql). Run this SQL to seed the database and you're good to go.
