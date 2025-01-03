export const handleDragEnd = (result, messages, wsMessages) => {
  const { source, destination, draggableId } = result
  if (!destination) return

  const [type, date] = destination.droppableId.split('_')

  const list = [
    ...messages.filter(
      msg => msg.type === type && (msg.date ? msg.date === date : true))].sort(
    (a, b) => a.position - b.position)

  const destinationMessage = list[destination.index]
  let otherPosition
  if (source.index > destination.index) {
    otherPosition = list[destination.index - 1]?.position ??
      destinationMessage.position - 2000
  } else {
    otherPosition = list[destination.index + 1]?.position ??
      destinationMessage.position + 2000
  }

  const newPosition = Math.round(
    (destinationMessage.position + otherPosition) / 2)

  wsMessages.update(draggableId, {
    position: newPosition,
    type: destinationMessage.type,
    date: destinationMessage.date,
  })
}
