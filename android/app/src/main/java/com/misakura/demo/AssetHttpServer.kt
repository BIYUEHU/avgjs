import android.content.Context
import fi.iki.elonen.NanoHTTPD
import java.io.IOException
import java.io.InputStream

class AssetHttpServer(private val context: Context, port: Int) : NanoHTTPD(port) {

    @Throws(IOException::class)
    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri
        return try {
            val assetManager = context.assets
            val inputStream: InputStream = assetManager.open(uri.substring(1))
            newChunkedResponse(Response.Status.OK, getMimeTypeForFile(uri), inputStream)
        } catch (e: IOException) {
            newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "File not found")
        }
    }
}
