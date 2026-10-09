# DesignDB

DesignDB is an open-source database diagram editor for creating, editing, importing, and exporting database schemas.

> **Fork and modification notice (2026-10-08):** DesignDB is a modified fork of [ChartDB](https://github.com/chartdb/chartdb). This project has been rebranded and includes additional changes. Upstream copyright and license notices are retained. DesignDB is distributed under the GNU Affero General Public License v3.0; see [LICENSE](LICENSE) and [FORK_NOTICE.md](FORK_NOTICE.md).

## Run locally

```sh
npm install
npm run dev
```

To build the app, run `npm run build`. Cloud diagram saving requires a Supabase project configured with the schema in `supabase/schema.sql` and the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.

## License and source

DesignDB is licensed under the [GNU Affero General Public License v3.0](LICENSE). If you run a modified version that users access over a network, AGPL-3.0 requires offering those users the corresponding source code. The source for this version is available at [github.com/pivix-innovations/designdb](https://github.com/pivix-innovations/designdb).

DesignDB is an independent fork and is not affiliated with or endorsed by ChartDB or ChartDB, Inc. The ChartDB name and marks belong to their respective owners.
