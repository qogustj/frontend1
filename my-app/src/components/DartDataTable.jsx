import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const DartDataTable = ({ data }) => {
  // 데이터가 없는 경우 표시할 메시지
  if (!data || data.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        데이터가 없습니다. 양식을 작성하고 조회 버튼을 클릭하세요.
      </div>
    );
  }

  // 테이블 컬럼 정의
  const columns = useMemo(
    () => [
      {
        header: '구분',
        accessorKey: 'se',
        cell: info => <strong>{info.getValue()}</strong>,
      },
      {
        header: '주식 종류',
        accessorKey: 'stockKnd',
        cell: info => info.getValue() || '-',
      },
      {
        header: '당기',
        accessorKey: 'thstrm',
      },
      {
        header: '전기',
        accessorKey: 'frmtrm',
      },
      {
        header: '전전기',
        accessorKey: 'lwfr',
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

  // 회사 정보 (모든 행이 동일한 회사 정보를 가지므로 첫 행에서 추출)
  const companyInfo = data[0];

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5>정보 조회 결과</h5>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <h4>{companyInfo.corpName} ({companyInfo.corpCode})</h4>
          <p>
            <strong>접수번호:</strong> {companyInfo.receptNo} |
            <strong> 결산월:</strong> {companyInfo.stlmDt} |
            <strong> 상태:</strong> {companyInfo.status === '000' ? '정상' : companyInfo.status}
          </p>
        </div>
        
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-nowrap"
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

export default DartDataTable;