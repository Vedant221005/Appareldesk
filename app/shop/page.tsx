import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ShoppingBag, Truck, Shield, Headphones } from "lucide-react"
import Image from "next/image"

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  })
}

export default async function ShopHomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-black rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          Welcome to <span className="text-primary">ApparelDesk</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Discover quality apparel for every occasion. Shop our latest collection.
        </p>
        <Link href="/shop/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center bg-black border-0">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2 text-white">Wide Selection</h3>
          <p className="text-sm text-gray-400">
            Browse through our extensive collection
          </p>
        </Card>
        <Card className="p-6 text-center bg-black border-0">
          <Truck className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2 text-white">Fast Delivery</h3>
          <p className="text-sm text-gray-400">
            Free shipping on orders above ₹999
          </p>
        </Card>
        <Card className="p-6 text-center bg-black border-0">
          <Shield className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2 text-white">Secure Payment</h3>
          <p className="text-sm text-gray-400">
            Safe and secure checkout process
          </p>
        </Card>
        <Card className="p-6 text-center bg-black border-0">
          <Headphones className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2 text-white">24/7 Support</h3>
          <p className="text-sm text-gray-400">
            We're here to help you anytime
          </p>
        </Card>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Featured Products</h2>
              <p className="text-gray-400 mt-1">Check out our latest arrivals</p>
            </div>
            <Link href="/shop/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/products/${product.slug}`}
              >
                <Card className="overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer h-full bg-black border-0">
                  <div className="relative aspect-square bg-slate-800">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">📦</div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-2 text-white">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </p>
                      {product.stock > 0 && (
                        <span className="text-xs text-gray-400">
                          {product.stock} left
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
