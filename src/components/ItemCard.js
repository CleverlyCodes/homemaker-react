export default function ItemCard(props) {
  const { id, name, description } = props.recipe;

  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
}