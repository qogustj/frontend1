// components/FutureDataTable.jsx
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const FutureDataTable = ({ data }) => {
  // 데이터가 없는 경우 표시할 메시지
  if (!data || data.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        주식선물 데이터가 없습니다.
      </div>
    );
  }

  // 테이블 컬럼 정의
  const columns = useMemo(
    () => [
      {
        header: '회사명',
        accessorKey: 'company',
        cell: info => <strong>{info.getValue()}</strong>,
      },
      {
        header: '제목',
        accessorKey: 'title',
      },
      {
        header: '확대 시간',
        accessorKey: 'expandTime',
      },
      {
        header: '상세정보',
        accessorKey: 'url',
        cell: info => (
          <a 
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            상세보기
          </a>
        ),
      },
    ],
    []
  );

  // react-table 훅 사용
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">주식선물 데이터</h5>
        <span className="badge bg-primary">총 {data.length}건</span>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FutureDataTable;