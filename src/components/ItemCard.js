export default function ItemCard(props) {
  const { selectItem, deleteItem, item } = props;

  return (
    <div onClick={event => selectItem(item.id, item.type)} className="card">
      <h3>{item.data.name}</h3>
      <p>{item.data.description}</p>
      <button onClick={event => deleteItem(item.id, item.type)}>Delete</button>
    </div>
  );
}
