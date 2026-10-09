import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HOST_URL } from '@/lib/env';

export const HelmetData: React.FC = () => (
    <Helmet>
        <meta
            name="description"
            content="Free and Open-source database diagrams editor, visualize and design your database with a single query. Tool to help you draw your DB relationship diagrams and export DDL scripts."
        />
        <meta property="og:type" content="website" />
        <meta
            property="og:title"
            content="DesignDB - Database schema diagrams visualizer"
        />
        <meta
            property="og:description"
            content="Free and Open-source database diagrams editor, visualize and design your database with a single query. Tool to help you draw your DB relationship diagrams and export DDL scripts."
        />
        <meta property="og:url" content={HOST_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
            name="twitter:title"
            content="DesignDB - Database schema diagrams visualizer"
        />
        <meta
            name="twitter:description"
            content="Free and Open-source database diagrams editor, visualize and design your database with a single query. Tool to help you draw your DB relationship diagrams and export DDL scripts."
        />
        <title>DesignDB - Database schema diagrams visualizer</title>
    </Helmet>
);
