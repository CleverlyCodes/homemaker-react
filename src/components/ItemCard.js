export default function ItemCard(props) {
  const { selectItem, deleteItem, item } = props;

  return (
    <div className="card">
      <h3>{item.data.name}</h3>
      <p>{item.data.description}</p>
      <button onClick={event => deleteItem(item.id, item.type)}>Delete</button>
      <button onClick={event => selectItem(item.id, item.type)}>View</button>
    </div>
  );
}
