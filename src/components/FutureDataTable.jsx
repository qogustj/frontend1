// components/FutureDataTable.jsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const FutureDataTable = ({ data }) => {
  // 새로운 데이터를 추적하기 위한 상태
  const [newDataIds, setNewDataIds] = useState(new Set());
  const [prevDataIds, setPrevDataIds] = useState(new Set());

  // 데이터 변경을 감지하고 새로운 행 하이라이트
  useEffect(() => {
    if (data && data.length > 0) {
      // 현재 데이터의 고유 식별자 집합 생성 (id 또는 다른 고유 필드 사용)
      // 여기서는 데이터 항목을 식별하기 위해 회사명+제목+확대시간의 조합을 사용
      const currentDataIds = new Set(
        data.map(item => `${item.company}_${item.title}_${item.expandTime}`)
      );
      
      // 이전에 데이터가 있었고, 새 데이터가 들어온 경우에만 처리
      if (prevDataIds.size > 0) {
        // 이전에 없던 새 데이터 식별
        const newIds = new Set();
        currentDataIds.forEach(id => {
          if (!prevDataIds.has(id)) {
            newIds.add(id);
          }
        });
        
        // 새 데이터 ID 설정
        if (newIds.size > 0) {
          setNewDataIds(newIds);
          
          // 10초 후에 강조 표시 제거
          setTimeout(() => {
            setNewDataIds(new Set());
          }, 10000);
        }
      }
      
      // 현재 데이터 ID를 이전 ID로 업데이트
      setPrevDataIds(currentDataIds);
    }
  }, [data]);

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

  // 행이 새 데이터인지 확인하는 함수
  const isNewRow = (row) => {
    const rowId = `${row.original.company}_${row.original.title}_${row.original.expandTime}`;
    return newDataIds.has(rowId);
  };

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
                <tr 
                  key={row.id}
                  className={isNewRow(row) ? "table-warning new-data-highlight" : ""}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      <div className={isNewRow(row) ? "px-2 position-relative" : ""}>
                        {isNewRow(row) && (
                          <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                            NEW
                          </span>
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 사용자 정의 스타일 추가 */}
      <style jsx>{`
        .new-data-highlight {
          animation: highlight-fade 10s ease-in-out;
        }
        
        @keyframes highlight-fade {
          0%, 70% {
            background-color: rgba(255, 193, 7, 0.3);
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default FutureDataTable;