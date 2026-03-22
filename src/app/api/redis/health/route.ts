import redis from "@/lib/redis";

export async function GET() {
  try {
    await redis.set("redis:health", "ok", { ex: 10 });
    const value = await redis.get("redis:health");

    return Response.json({
      status: "connected",
      value,
    });
  } catch (error: any) {
    return Response.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
