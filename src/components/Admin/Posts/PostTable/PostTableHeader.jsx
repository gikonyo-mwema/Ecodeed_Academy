import { Table } from 'flowbite-react';

export default function PostTableHeader() {
  return (
    <Table.Head>
      <Table.HeadCell>Date</Table.HeadCell>
      <Table.HeadCell>Image</Table.HeadCell>
      <Table.HeadCell>Title</Table.HeadCell>
      <Table.HeadCell>Category</Table.HeadCell>
      <Table.HeadCell>Actions</Table.HeadCell>
      <Table.HeadCell>
        <span className="sr-only">Edit</span>
      </Table.HeadCell>
    </Table.Head>
  );
}