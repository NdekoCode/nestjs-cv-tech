import Link from 'next/link';

import { api } from '@/core/services';
import { CvArraySchema, TCv } from '@/core/types/schemas/cv.schema';

const getAllCvs = async () => {
  const res = await api.get<Promise<{ data: TCv[] }>>("/cv");
  const data = CvArraySchema.parse(res.data);
  console.log(data);
  return data;
};
const page = async () => {
  const data = await getAllCvs();
  return (
    <div>
      <>
        {/* Card Section */}
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          {/* Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {/* Card */}
            {data.map(
              (cv, index) =>
                cv && (
                  <Link
                    key={cv.id}
                    className="group flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl hover:shadow-md focus:outline-hidden focus:shadow-md transition dark:bg-neutral-900 dark:border-neutral-800"
                    href={`/cv/${cv.id}`}
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex justify-between items-center gap-x-3">
                        <div className="grow">
                          <h3 className="group-hover:text-blue-600 font-semibold text-gray-800 dark:group-hover:text-neutral-400 dark:text-neutral-200">
                            {cv.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-neutral-500">
                            {cv.job}
                          </p>
                        </div>
                        <div>
                          <svg
                            className="shrink-0 size-5 text-gray-800 dark:text-neutral-200"
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
            )}

            {/* End Card */}
          </div>
          {/* End Grid */}
        </div>
        {/* End Card Section */}
      </>
    </div>
  );
};

export default page;
