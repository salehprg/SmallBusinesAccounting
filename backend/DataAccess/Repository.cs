using New_Back.Data;
using New_Back.DataAccess;
using New_Back.Domain;

namespace New_Back.DataAccess;

public interface IRepository<T> where T : BaseEntity
{
    public IQueryable<T> GetAll();
    public IQueryable<T> GetById(int id);
    public void Add(T entity);
    public void AddRange(IEnumerable<T> entities);
    public void UpdateRange(IEnumerable<T> entities);
    public void Edit(T entity);
    public void Remove(T entity);
    public void SaveChanges();
    public void StartTransaction();
    public void CommitTransaction();
    public void RollbackTransaction();
}

public class Repository<T>(DatabaseContext databaseContext) : IRepository<T> where T : BaseEntity
{
    readonly DatabaseContext databaseContext = databaseContext;

    public virtual void Add(T entity)
    {
        databaseContext.Add(entity);
        SaveChanges();
    }

    public void AddRange(IEnumerable<T> entities)
    {
        databaseContext.AddRange(entities);
        SaveChanges();
    }

    public virtual void UpdateRange(IEnumerable<T> entities)
    {
        databaseContext.UpdateRange(entities);
        SaveChanges();
    }

    public virtual void Edit(T entity)
    {
        databaseContext.Update(entity);
        SaveChanges();
    }

    public virtual IQueryable<T> GetById(int id)
    {
        return databaseContext.Set<T>().Where(x => x.Id == id);
    }

    public virtual void Remove(T entity)
    {
        databaseContext.Remove(entity);
        SaveChanges();
    }

    public virtual void StartTransaction()
    {
        if (databaseContext.Database.CurrentTransaction == null)
            databaseContext.Database.BeginTransaction();
    }

    public virtual void RollbackTransaction()
    {
        if (databaseContext.Database.CurrentTransaction != null)
            databaseContext.Database.RollbackTransaction();
    }

    public virtual void CommitTransaction()
    {
        if (databaseContext.Database.CurrentTransaction != null)
            databaseContext.Database.CommitTransaction();
    }

    public virtual void SaveChanges()
    {
        databaseContext.SaveChanges();
    }

    public virtual IQueryable<T> GetAll()
    {
        return databaseContext.Set<T>().AsQueryable();
    }
}