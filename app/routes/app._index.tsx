/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Box,
  Card,
  InlineGrid,
  InlineStack,
  Link,
  List,
  Page,
  Text,
} from "@shopify/polaris";
import { useEffect } from "react";
import db from '../db.server';
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let wishlists = await db.wishlist.findMany()
  const uniqueCustomers = [...new Set(wishlists.map(wishlist => wishlist.customerId))];

  let appData = {
    wishlists,
    uniqueCustomers
  }
  return json(appData);
};



export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const variantId =
    responseJson.data!.productCreate!.product!.variants.edges[0]!.node!.id!;
  const variantResponse = await admin.graphql(
    `#graphql
      mutation shopifyRemixTemplateUpdateVariant($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant {
            id
            price
            barcode
            createdAt
          }
        }
      }`,
    {
      variables: {
        input: {
          id: variantId,
          price: Math.random() * 100,
        },
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return json({
    product: responseJson!.data!.productCreate!.product,
    variant: variantResponseJson!.data!.productVariantUpdate!.productVariant,
  });
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const appData = useLoaderData<typeof loader>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page>
      <Box paddingBlockEnd="400">
        <Text variant="headingLg" as="h2">Dashboard</Text>
      </Box>

      <Box paddingBlockEnd="400">
        <Card>
          <Text variant="headingMd" as="h2">Wishlist stats</Text>

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

          <Link url="/app/wishlists">More Info</Link>
        </Card>
      </Box>

      <Box paddingBlockEnd="400">
        <Card>
          <Text variant="headingMd" as="h2">Install</Text>

          <Box paddingBlockStart={"400"} paddingBlockEnd={"400"}>
            <Text variant="bodyMd" as="p">Finish the app installation at the Theme editor.</Text>
          </Box>

          <Box paddingBlockEnd={"400"}>
            <Text variant="bodyMd" as="p">1. Enable app embeds</Text>
            <List type="bullet">
              <List.Item>Open the Theme editor</List.Item>
              <List.Item>Open the App embeds tab</List.Item>
              <List.Item>Find and enable the "Popup & Sidebar" block provided by "Wishlist" app</List.Item>
            </List>
          </Box>

          <Box paddingBlockEnd={"400"}>
            <Text variant="bodyMd" as="p">Add button on product page</Text>
            <List type="bullet">
              <List.Item>Open the Theme editor</List.Item>
              <List.Item>Navigate to product page</List.Item>
              <List.Item>Add wishlist button block to the product information section</List.Item>
            </List>
          </Box>
        </Card>
      </Box>

      <Box paddingBlockEnd="400">
        <Card>
          <Text variant="headingMd" as="h2">Support</Text>

          <Box paddingBlockStart={"400"} paddingBlockEnd={"400"}>

            <InlineStack gap={"100"}>
              <Text variant="bodyMd" as="p">If you have any questions drop me a message to</Text>
              <Link url="mailto:ratul@pointerflow@gmail.com">ratul@pointerflow@gmail.com</Link>
            </InlineStack>
          </Box>
        </Card>
      </Box>
    </Page>
  );
}
