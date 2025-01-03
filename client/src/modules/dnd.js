import messagesTypes from '@src/modules/messagesTypes.js'

export const handleDragEnd = (result, messages, wsMessages) => {
  const { source, destination, draggableId } = result
  if (!destination) return

  const [type, date] = destination.droppableId.split('_')

  let list = [...messages[type]];
  if (type === messagesTypes.calendar) {
    list = list.filter(msg => msg.date === date)
  }
  list = list.sort((a, b) => a.position - b.position)
  console.log('list', list)

  const destinationMessage = list[destination.index];
  let otherPosition;
  if (source.index > destination.index) {
    otherPosition = list[destination.index - 1]?.position ?? destinationMessage.position - 2000;
  } else {
    otherPosition = list[destination.index + 1]?.position ?? destinationMessage.position + 2000;
  }

  const newPosition = Math.round((destinationMessage.position + otherPosition) / 2);

  wsMessages.update(type, draggableId, { position: newPosition });
}
