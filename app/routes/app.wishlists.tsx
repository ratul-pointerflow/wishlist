/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    Box,
    Button,
    Card,
    DataTable,
    InlineGrid,
    InlineStack,
    Page,
    Pagination,
    Text,
} from "@shopify/polaris";
import {
    ArrowLeftIcon
} from '@shopify/polaris-icons';
import { useState } from "react";
import db from '../db.server';

const ITEMS_PER_PAGE = 10;

export const loader = async () => {
    let wishlists = await db.wishlist.findMany();
    const uniqueCustomers = [...new Set(wishlists.map(wishlist => wishlist.customerId))];

    let productRow: any = []
    wishlists.forEach((wishlist) => {
        let product: any = JSON.parse(wishlist.product || "");
        let tableData: any = [
            product.title,
            product.price,
            wishlist.productHandle,
            wishlist.customerId
        ]

        productRow.push(tableData);
    })

    let appData = {
        wishlists,
        uniqueCustomers,
        productRow
    }
    return json(appData);
};

export default function wishlists() {
    const [currentPage, setCurrentPage] = useState(1);
    const appData = useLoaderData<typeof loader>();

    const rows = appData.productRow;


    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(rows.length / ITEMS_PER_PAGE)));
    };

    const paginatedRows = rows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    return (
        <Page>
            <Box paddingBlockEnd="400">
                <InlineStack blockAlign="center" gap={"200"}>
                    <Button icon={ArrowLeftIcon} url='/app'></Button>
                    <Text variant="headingLg" as="h2">Wishlist stats</Text>
                </InlineStack>
            </Box>

            <Box paddingBlockEnd="400">
                <Card>
                    <Text variant="headingMd" as="h2">Total</Text>

                    <InlineGrid gap="400" columns={2}>

                        <Box paddingBlockEnd="400" paddingBlockStart="400">
                            <InlineStack align="start" gap="200" blockAlign="center">
                                <Text variant="heading2xl" as="h2">{appData.wishlists.length}</Text>
                                <Text variant="headingSm" as="p">products</Text>
                            </InlineStack>
                        </Box>

                        <Box paddingBlockEnd="400" paddingBlockStart="400">
                            <InlineStack align="start" gap="200" blockAlign="center">
                                <Text variant="heading2xl" as="h2">{appData.uniqueCustomers.length}</Text>
                                <Text variant="headingSm" as="p">Customer</Text>
                            </InlineStack>
                        </Box>

                    </InlineGrid>
                </Card>
            </Box>

            <Box paddingBlockEnd="400">
                <Card>
                    <Text variant="headingMd" as="h2">Top products</Text>

                    <Box paddingBlockStart={"400"} paddingBlockEnd={"400"}>
                        <DataTable
                            columnContentTypes={['text', 'text', 'text', 'text',]}
                            headings={['Product', 'Price', 'Handle', 'Customer']}
                            rows={paginatedRows}
                        />
                    </Box>
                    <Box>
                        <InlineStack align="end">
                            <Pagination
                                hasPrevious={currentPage > 1}
                                onPrevious={handlePreviousPage}
                                hasNext={currentPage < Math.ceil(rows.length / ITEMS_PER_PAGE)}
                                onNext={handleNextPage}
                            />
                        </InlineStack>
                    </Box>
                </Card>
            </Box>
        </Page>
    )
}
