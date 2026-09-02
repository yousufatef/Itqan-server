import { StudentsService } from './students.service';

describe('StudentsService', () => {
    let studentRepository: any;
    let parentRepository: any;
    let parentStudentRepository: any;
    let service: StudentsService;

    beforeEach(() => {
        studentRepository = {
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
        };

        parentRepository = {
            findOne: jest.fn(),
        };

        parentStudentRepository = {
            save: jest.fn(),
            delete: jest.fn(),
        };

        service = new StudentsService(
            studentRepository,
            parentRepository,
            parentStudentRepository,
        );
    });

    it('should paginate students with search and normalize response fields', async () => {
        studentRepository.findAndCount.mockResolvedValue([
            [
                {
                    id: 1,
                    name: 'Ali Hassan',
                    phone_number: '0501234567',
                    birth_date: '2020-02-15',
                    created_at: new Date('2024-01-01T00:00:00Z'),
                    updated_at: new Date('2024-01-02T00:00:00Z'),
                    parentStudents: [{ parent_id: 8, parent: { id: 8, user_id: 77 } }],
                },
            ],
            1,
        ]);

        const result = await service.getPaginatedStudents(1, 10, 'ali');

        expect(studentRepository.findAndCount).toHaveBeenCalled();
        expect(result.data[0]).toMatchObject({
            id: 1,
            name: 'Ali Hassan',
            phoneNumber: '0501234567',
            birthOfDate: '2020-02-15',
            parentId: 8,
            parentUserId: 77,
        });
    });

    it('should create a student and link it to a parent from the parent user id', async () => {
        parentRepository.findOne.mockResolvedValue({ id: 8, user_id: 77 });
        studentRepository.create.mockReturnValue({
            name: 'Sara',
            phone_number: '0507654321',
            birth_date: '2018-03-10',
        });
        studentRepository.save.mockResolvedValue({
            id: 9,
            name: 'Sara',
            phone_number: '0507654321',
            birth_date: '2018-03-10',
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
        });
        parentStudentRepository.save.mockResolvedValue({ parent_id: 8, student_id: 9 });

        const result = await service.createStudent({
            name: 'Sara',
            phoneNumber: '0507654321',
            birthOfDate: '2018-03-10',
            parent: 77,
        });

        expect(parentRepository.findOne).toHaveBeenCalled();
        expect(parentStudentRepository.save).toHaveBeenCalledWith({
            parent_id: 8,
            student_id: 9,
        });
        expect(result).toMatchObject({
            id: 9,
            name: 'Sara',
            phoneNumber: '0507654321',
            birthOfDate: '2018-03-10',
            parentId: 8,
        });
    });
});
