const { PrismaClient } = require("@prisma/client")
const express = require("express")
const cors = require("cors")
const app = express()
const { createServer } = require("http")
const { Server } = require("socket.io")
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })
const port = process.env.PORT || 5000
const prisma = new PrismaClient()
app.use(cors())
io.on("connection", (socket) => {
  console.log("new connection")


  socket.on("create-room", async (room) => {
    console.log("new room created")
    const newRoom = await prisma.rooms.create({ data: room })
    socket.emit("room-created", newRoom)
    prisma.rooms.findMany().then(allRooms => {
      io.emit("rooms", allRooms)
    })

  })

  socket.on("create-answer", async (room) => {

    console.log("new answer ", room)
    try {
      const newRoom = await prisma.rooms.update({
        data: {
          answerSdp: room.sdp,
          answerType: room.type,
        },
        where: {
          id: room.id
        }
      })
      io.emit("room-updated", newRoom)
      console.log("room updated: ", newRoom)
    } catch (err) {
      console.log("error:",err)
    }

  })
})


server.listen(port, () => {
  console.log(`server running on port: ${port}...`)
})





