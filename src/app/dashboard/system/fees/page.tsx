'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";


export default function SystemFeesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">System Fee Structure</h1>
                <p className="text-muted-foreground">
                    Define tuition fees, payment deadlines, and other charges for different class groups.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Fee Management Moved</CardTitle>
                    <CardDescription>
                        To better align with operational workflows, the management of fee structures has been moved to the Accountant's dashboard.
                        <br /><br />
                        Please use the link below to access the fee management page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/accountant/fees">
                            Go to Fee Management <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
