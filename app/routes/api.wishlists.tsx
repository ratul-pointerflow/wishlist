/* eslint-disable @typescript-eslint/no-unused-vars */

import { json } from "@remix-run/react";
import { cors } from "remix-utils/cors";
import db from '../db.server';

export async function loader({ request }: any) {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const productHandle = url.searchParams.get("productHandle");
    const customerId = url.searchParams.get("customerId");
    const shop = url.searchParams.get("shop");

    if (customerId && shop) {

        // get single product
        if (productId && productHandle) {
            const wishlist = await db.wishlist.findMany({
                where: {
                    productId,
                    productHandle,
                    customerId,
                    shop
                },
            });


            const response = json({
                success: true,
                message: wishlist.length ? "Product found" : "Product not found",
                data: wishlist,
            });

            return cors(request, response);
        }

        // get all products
        const wishlist = await db.wishlist.findMany({
            where: {
                customerId,
                shop
            },
        });


        const response = json({
            success: true,
            message: wishlist.length ? "Products found" : "Products not found",
            data: wishlist,
        });

        return cors(request, response);

    } else {
        const response = json({
            success: false,
            message: "Missing data"
        });

        return cors(request, response);
    }
}


export async function action({ request }: any) {
    // request type
    let method = request.method;
    let response;

    // form data
    console.log(request);
    let data = await request.formData();
    data = Object.fromEntries(data);
    const productId = data.productId;
    const productHandle = data.productHandle;
    const product = data.product;
    const customerId = data.customerId;
    const shop = data.shop;


    // handle request
    switch (method) {
        case "POST":
            if (productId && productHandle && customerId && shop) {
                const wishlist = await db.wishlist.create({
                    data: {
                        productId,
                        productHandle,
                        product,
                        customerId,
                        shop
                    }
                });

                return json({
                    success: true,
                    message: "Product added to wishlist",
                    data: wishlist
                });
            } else {
                return json({
                    success: false,
                    message: "Missing data"
                });
            }

        case "DELETE":
            if (productId && productHandle && customerId && shop) {
                await db.wishlist.deleteMany({
                    where: {
                        productId,
                        productHandle,
                        customerId,
                        shop
                    },
                });

                response = json({
                    success: true,
                    message: "Product deleted form the list"
                });

                return cors(request, response);
            } else {
                return json({
                    success: false,
                    message: "Missing data"
                });
            }

        default:
            return json({
                success: false,
                message: "Method not found"
            });

    }
}